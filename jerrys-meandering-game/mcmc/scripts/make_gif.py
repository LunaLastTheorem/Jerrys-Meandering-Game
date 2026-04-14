import pickle
from pathlib import Path

from gerrychain.partition import GeographicPartition


from scripts.data_loader import load_graph
from scripts.setup import create_initial_partition
from scripts.plot import plot_partition_to_array
from scripts.gif import save_gif

def make_gif():
    root_directory = Path(__file__).parent.parent
    data_directory = root_directory / 'simulation_data' / 'ut'
    output_directory = root_directory / 'outputs'

    # reload graph + partition
    graph = load_graph(data_directory / 'ut.shp')
    partition, _ = create_initial_partition(graph)

    # load assignments
    with open(output_directory / "06_assignments.pkl", "rb") as f:
        assignments = pickle.load(f)

    frames = []

    for assignment in assignments:
        new_partition = GeographicPartition(
            partition.graph,
            assignment=assignment,
            updaters=partition.updaters
        )
        frames.append(plot_partition_to_array(new_partition))

    save_gif(frames, output_directory / "06_ns_contiguity_pop_pp.gif")

if __name__ == "__main__":
    make_gif()