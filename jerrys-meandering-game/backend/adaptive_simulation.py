from gerrychain import MarkovChain, accept
from gerrychain.proposals import recom
from gerrychain.constraints import contiguous, within_percent_of_ideal_population
from functools import partial
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import base64
from io import BytesIO
import statistics

def determine_steps(grid_rows, grid_cols):
    """
    Determine MCMC step count based on grid size.

    Args:
        grid_rows: Number of rows in grid
        grid_cols: Number of cols in grid
    
    Returns:
        dict with keys: 'total_steps', 'thin', 'expected_samples'
    """

    num_cells = grid_rows * grid_cols

    if num_cells <= 25: # 5x5 or smaller
        return {
            'total_steps': 1000,
            'thin': 1,
            'expected_samples': 1000
        }
    elif num_cells <= 100: # 10x10 or smaller
        return {
            'total_steps': 10000,
            'thin': 10,
            'expected_samples': 1000
        }
    else: # Larger than 10x10
        return {
            'total_steps': 20000,
            'thin': 100,
            'expected_samples': 2000
        }

def run_mcmc_simulation(partition, num_districts, grid_rows, grid_cols):
    """
    Run MCMC simulation on a partition using ReCom proposal.

    Args:
        partition: gerrychain.Partition object (initial state)
        num_districts: Number of districts in the partition
        grid_rows: Number of rows in the grid
        grid_cols: Number of cols in the grid
    
    Returns:
        dict with keys:
            - 'dem_seats': List of Democratic seats won in each sample
            - 'dem_vote_share': List of Democratic vote share in each sample
            - 'submitted_dem_seats': Seats won by Democrats in submitted map
            - 'submitted_dem_vote_share': Democratic vote share in submitted map
            - 'num_samples': Total number of samples collected
    """
    # Determines step count
    step_config = determine_steps(grid_rows, grid_cols)
    total_steps = step_config['total_steps']
    thin = step_config['thin']

    # Calculate ideal population per district
    total_pop = sum(partition["population"].values())
    ideal_population = total_pop / num_districts

    # Build ReCom proposal
    proposal = partial(
        recom,
        pop_col="TOTPOP",
        pop_target=ideal_population,
        epsilon=0.01,
        node_repeats=2,
    )

    # Build population constraint
    pop_constraint = within_percent_of_ideal_population(partition, percent=0.01)

    # Build Markov Chain
    chain = MarkovChain(
        proposal=proposal,
        constraints = [contiguous, pop_constraint],
        accept=accept.always_accept,
        initial_state=partition,
        total_steps=total_steps
    )

    # Calculate initial (submitted) map metrics
    submitted_dem_seats = 0
    submitted_rep_seats = 0
    submitted_tie_seats = 0

    for d in partition.parts:
        dem = partition['dem_votes'][d]
        rep = partition['rep_votes'][d]

        if dem > rep:
            submitted_dem_seats += 1
        elif rep > dem:
            submitted_rep_seats += 1
        else:
            submitted_tie_seats += 1

    # Run chain and collect samples
    dem_seats_list = []
    rep_seats_list = []
    tie_seats_list = []

    for step, current_partition in enumerate(chain):
        if step % thin != 0:
            continue

        # Count Democratic, Republican and Tie seats
        dem_seats = 0
        rep_seats = 0
        tie_seats = 0

        for d in current_partition.parts:
            dem = current_partition['dem_votes'][d]
            rep = current_partition['rep_votes'][d]

            if dem > rep:
                dem_seats += 1
            elif rep > dem:
                rep_seats += 1
            else:
                tie_seats += 1
        dem_seats_list.append(dem_seats)
        rep_seats_list.append(rep_seats)
        tie_seats_list.append(tie_seats)

    
    return {
        'dem_seats': dem_seats_list,
        'rep_seats': rep_seats_list,
        'tie_seats': tie_seats_list,
        'submitted_dem_seats': submitted_dem_seats,
        'submitted_rep_seats': submitted_rep_seats,
        'submitted_tie_seats': submitted_tie_seats,
        'num_samples': len(dem_seats_list),
        'num_districts': num_districts
    }

def compute_fairness_statement(seats, submitted_seats):
    total = len(seats)
    if total == 0:
        return 0, "unknown"

    worse = sum(1 for s in seats if s < submitted_seats)
    pct = 100 * worse / total

    if pct < 60:
        strength = "weak"
    elif pct < 80:
        strength = "moderate"
    else:
        strength = "strong"

    return pct, strength

def compute_results_data(results, party):
    """
    Compute histogram statistics for seat outcome.

    Args:
        results: Dictionary returned by run_mcmc_simulation()
        party: string 'rep' or 'dem' based on party to win
    
    Returns:
        dict with histogram data for frontend rendering
    """
    dem_seats = results['dem_seats']
    rep_seats = results['rep_seats']

    seats = results[f'{party}_seats']
    submitted_seats = results[f'submitted_{party}_seats']

    # Calculate statistics
    if seats:
        median_seats = statistics.median(seats)
        mean_seats = sum(seats) / len(seats)
        min_sample = min(seats)
        max_sample = max(seats)
    else:
        median_seats = submitted_seats
        mean_seats = submitted_seats
        min_sample = submitted_seats
        max_sample = submitted_seats
    
    # Party favorable by each generated map
    dem_favorable = 0
    rep_favorable = 0
    tied = 0

    for d, r in zip(dem_seats, rep_seats):
        if d > r:
            dem_favorable += 1
        elif r > d:
            rep_favorable += 1
        else:
            tied += 1
    
    total = len(seats)

    # Fairness assessment
    pct, strength = compute_fairness_statement(seats, submitted_seats)

    if party == "dem":
        direction = "Democrat-leaning"
    else:
        direction = "Republican-leaning"

    fairness_statement = f"Your map is more {direction} than {pct:.0f}% of generated maps, indicating a {strength} gerrymander."

    return {
        'submitted_seats': submitted_seats,
        'medians': median_seats,
        'mean': mean_seats,
        'min': min_sample,
        'max': max_sample,
        'dem_favorable_pct': (dem_favorable / total) * 100 if seats else 0,
        'rep_favorable_pct': (rep_favorable / total) * 100 if seats else 0,
        'tied_pct': (tied / total) * 100 if seats else 0,
        'total_samples': total,
        'num_districts': results['num_districts'],
        'fairness_statement': fairness_statement
    }
    
def generate_histogram_png(results, party, color):
    """
    Generate histogram PNG image showing Democratic seat distribution.

    Args:
        results: Dictionary returned by run_mcmc_simulation()

    Returns:
        Base64-encoded PNG image string
    """

    seats = results[f"{party}_seats"]
    submitted_seats = results[f"submitted_{party}_seats"]

    if not seats:
        raise ValueError("No samples collected from MCMC simulation")

    try:
        # Create figure
        fig, ax = plt.subplots(figsize=(8, 5))

        for spine in ax.spines.values():
            spine.set_visible(False)
    
        # Integer-centered bins
        min_seats = int(min(seats))
        max_seats = int(max(seats))

        bins = range(min_seats, max_seats + 2)

        # Histogram
        counts, bin_edges, patches = ax.hist(
            seats,
            bins=bins,
            align='left',
            color=color,
            edgecolor="white",
            rwidth=0.8
        )

        total_samples = len(seats)

        for count, patch in zip(counts, patches):
            if count > 0:
                percentage = (count / total_samples) * 100

                x = patch.get_x() + patch.get_width() / 2
                y = patch.get_height()

                ax.text(
                    x,
                    y + max(counts) * 0.01,
                    f"{percentage:.0f}%",
                    ha="center",
                    va="bottom",
                    fontsize=10,
                    fontweight="bold",
                    color="#2c3e50",
                    bbox=dict(facecolor="white", edgecolor="none", pad=1.5)
                )

        ax.axvline(
            submitted_seats,
            color="#000000",
            linestyle="--",
            linewidth=2,
            label=f"Your Map ({submitted_seats}) seats"
        )

        if party == 'dem':
            xlabel = "Number of Democratic Districts"
            title = "Distribution of Total Democratic Districts Across Simulated Maps"
            caption = "Histogram of how many Democratic districts were generated for each alternative map in MCMC simulation. Black line represents how many Democratic districts you created."
        else:
            xlabel = "Number of Republican Districts"
            title = "Distribution of Total Republican Districts Across Simulated Maps"
            caption = "Histogram of how many Republican districts were generated for each alternative map in MCMC simulation. Black line represents how many Republican districts you created."
        
        ax.set_title(
            title,
            fontsize=16,
            pad=12
        )

        ax.set_xlabel(
            xlabel,
            fontsize=13,
            labelpad=8
        )
        ax.set_ylabel(
            "Frequency (MCMC samples)",
            fontsize=13,
            labelpad=8
        )

        ax.set_xticks(range(min_seats, max_seats + 1))
        ax.tick_params(axis='both', labelsize=11)

        ax.set_xlim(min_seats - 0.5, max_seats + 0.5)
        ax.set_ylim(0, max(counts) * 1.2)

        ax.grid(axis="y", alpha=0.3)
        ax.set_axisbelow(True)
        ax.legend()

        fig.tight_layout()
        fig.subplots_adjust(top=0.88, bottom=0.2, left=0.12, right=0.98)
        fig.text(
            0.5, 0.03,
            caption,
            ha='center',
            fontsize=10,
            wrap=True
        )

        buffer = BytesIO()
        fig.savefig(buffer, format="png", dpi=120, bbox_inches="tight")
        buffer.seek(0)

        image_base64 = base64.b64encode(buffer.read()).decode("utf-8")
        plt.close(fig)

        return image_base64

    except Exception as e:
        plt.close("all")
        print(f"Error generating histogram: {e}")
        raise