from gerrychain import MarkovChain, accept
from gerrychain.proposals import recom
from gerrychain.constraints import contiguous, within_percent_of_ideal_population
from functools import partial
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import base64
from io import BytesIO

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

    # Collect data from chain
    dem_seats_list = []
    dem_vote_share_list = []

    # Calculate initial (submitted) map metrics
    submitted_dem_seats = sum(
        1 for d in partition.parts if partition['dem_votes'][d] > partition['rep_votes'][d]
    )
    submitted_dem_votes = sum(partition['dem_votes'].values())
    submitted_total_votes = sum(partition['population'].values())
    submitted_dem_votes_share = submitted_dem_votes / submitted_total_votes if submitted_total_votes > 0 else 0

    # Run chain and collect samples
    for step, current_partition in enumerate(chain):
        if step % thin != 0:
            continue

        # Count Democratic seats
        dem_seats = sum(
            1 for d in current_partition.parts if current_partition['dem_votes'][d] > current_partition['rep_votes'][d]
        )
        dem_seats_list.append(dem_seats)

        # Calculate Democratic vote share
        dem_votes = sum(current_partition['dem_votes'].values())
        total_votes = sum(current_partition['population'].values())
        dem_vote_share = dem_votes / total_votes if total_votes > 0 else 0
        dem_vote_share_list.append(dem_vote_share)
    
    return {
        'dem_seats': dem_seats_list,
        'dem_vote_share': dem_vote_share_list,
        'submitted_dem_seats': submitted_dem_seats,
        'submitted_dem_vote_share': submitted_dem_votes_share,
        'num_samples': len(dem_seats_list)
    }

def compute_histogram_data(results):
    """
    Compute histogram statistics for Democratic seat share.

    Args:
        results: Dictionary returned by run_mcmc_simulation()
    
    Returns:
        dict with histogram data for frontend rendering
    """

    dem_seats = results['dem_seats']
    submitted_seats = results['submitted_dem_seats']

    # Compute histogram bins
    min_seats = min(dem_seats) if dem_seats else 0
    max_seats = max(dem_seats) if dem_seats else 0

    # Create bins (one bin per seat count)
    bins = range(min_seats, max_seats + 2) # +2 to include max_seats in bins

    # Count occurrences
    histogram = {}
    for i in range(min_seats, max_seats + 1):
        histogram[i] = dem_seats.count(i)

        # Calculate statistics
        if dem_seats:
            median_seats = sorted(dem_seats)[len(dem_seats) // 2]
            mean_seats = sum(dem_seats) / len(dem_seats)
            min_sample = min(dem_seats)
            max_sample = max(dem_seats)
        else:
            median_seats = submitted_seats
            mean_seats = submitted_seats
            min_sample = submitted_seats
            max_sample = submitted_seats
        
        # Count how many simulated outcomes are more favorable to each party
        dem_favorable = sum(1 for s in dem_seats if s > submitted_seats)
        rep_favorable = sum(1 for s in dem_seats if s < submitted_seats)
        tied = sum(1 for s in dem_seats if s == submitted_seats)

        return {
            'histogram': histogram,
            'bins': list(bins),
            'submitted_seats': submitted_seats,
            'medians': median_seats,
            'mean': mean_seats,
            'min': min_sample,
            'max': max_sample,
            'dem_favorable_pct': (dem_favorable / len(dem_seats)) * 100 if dem_seats else 0,
            'rep_favorable_pct': (rep_favorable / len(dem_seats)) * 100 if dem_seats else 0,
            'tied_pct': (tied / len(dem_seats)) * 100 if dem_seats else 0,
            'total_samples': len(dem_seats),
            'submitted_vote_share': results['submitted_dem_vote_share'],
            'mean_vote_share': sum(results['dem_vote_share']) / len(results['dem_vote_share']) if results['dem_vote_share'] else 0,
        }
    
def generate_histogram_png(results):
    """
    Generate histogram PNG image showing Democratic seat distribution.

    Args:
        results: Dictionary returned by run_mcmc_simulation()

    Returns:
        Base64-encoded PNG image string
    """

    dem_seats = results["dem_seats"]
    submitted_seats = results["submitted_dem_seats"]

    if not dem_seats:
        raise ValueError("No samples collected from MCMC simulation")

    try:
        # Create figure
        fig, ax = plt.subplots(figsize=(8, 5))

        for spine in ax.spines.values():
            spine.set_visible(False)
    
        # Integer-centered bins
        min_seats = int(min(dem_seats))
        max_seats = int(max(dem_seats))

        bins = range(min_seats, max_seats + 2)

        # Histogram
        counts, bin_edges, patches = ax.hist(
            dem_seats,
            bins=bins,
            align='left',
            color="#2980b9",
            edgecolor="white",
            rwidth=0.8
        )

        total_samples = len(dem_seats)

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
            color="#e94634",
            linestyle="--",
            linewidth=2,
            label=f"Your Map ({submitted_seats}) seats"
        )

        ax.set_xlabel("Democratic Seats")
        ax.set_ylabel("Frequency")
        ax.set_title("Probability Distribution of Democratic Seats")

        ax.set_xticks(range(min_seats, max_seats + 1))
        ax.set_xlim(min_seats - 0.5, max_seats + 0.5)

        ax.set_ylim(0, max(counts) * 1.2)

        ax.grid(axis="y", alpha=0.3)
        ax.set_axisbelow(True)
        ax.legend()

        fig.tight_layout()

        buffer = BytesIO()
        fig.savefig(buffer, format="png", dpi=90, bbox_inches="tight")
        buffer.seek(0)

        image_base64 = base64.b64encode(buffer.read()).decode("utf-8")
        plt.close(fig)

        return image_base64

    except Exception as e:
        plt.close("all")
        print(f"Error generating histogram: {e}")
        raise