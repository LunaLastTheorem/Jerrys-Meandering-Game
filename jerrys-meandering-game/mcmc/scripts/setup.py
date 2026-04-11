from gerrychain import GeographicPartition, updaters
from gerrychain.metrics import polsby_popper

def create_initial_partition(graph):
    my_updaters = {
        "population": updaters.Tally("TOTPOP", alias="population"),
        "cut_edges": updaters.cut_edges,
        "perimeter": updaters.perimeter,
        "area": updaters.Tally("area_m", alias="area"),
        "polsby_popper": polsby_popper,
        "dem_votes": updaters.Tally("PRE20D", alias="dem_votes"),
        "rep_votes": updaters.Tally("PRE20R", alias="rep_votes"),
        "other_votes": updaters.Tally("PRE20O", alias="other_votes")
    }

    partition = GeographicPartition(
        graph,
        assignment="CD",
        updaters=my_updaters
    )

    ideal_population = sum(partition["population"].values()) / len(partition)

    return partition, ideal_population