from pathlib import Path
import pickle

from scripts.data_loader import load_graph
from scripts.setup import create_initial_partition
from scripts.chain import build_chain
from scripts.collect_data import collect_chain_data
from scripts.gif import save_gif

def main():
    root_directory = Path(__file__).parent.parent
    data_directory = root_directory / 'simulation_data' / 'ut'

    data_filename = data_directory / 'ut.shp'

    # Step 1: Load the graph
    graph = load_graph(data_filename)

    # Step 2: Create the initial partition
    partition, ideal_population = create_initial_partition(graph)

    # Step 3: Build the Markov Chain
    chain = build_chain(graph, partition, ideal_population, steps=20000)

    # Step 4: Run the chain and collect the data
    df, assignments = collect_chain_data(
        chain, 
        burn_in=2000, 
        thin=20, 
        total_steps=20000
    )

    # Step 5: Save outputs
    output_directory = root_directory / 'outputs'
    output_directory.mkdir(exist_ok=True)

    df.to_csv(output_directory / '06_ns_contiguity_pop_pp.csv', index=False)

    with open(output_directory / "06_assignments.pkl", "wb") as f:
        pickle.dump(assignments, f)

if __name__ == "__main__":
    main()