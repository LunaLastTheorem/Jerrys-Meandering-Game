from gerrychain import MarkovChain, accept
from gerrychain.proposals import recom
from gerrychain.constraints import contiguous, within_percent_of_ideal_population
from gerrychain.constraints.compactness import no_worse_L_minus_1_polsby_popper
from functools import partial

def build_chain(graph, partition, ideal_population, steps):
    proposal = partial(
        recom,
        pop_col="TOTPOP",
        pop_target=ideal_population,
        epsilon=0.01,
        node_repeats=2,
    )

    pop_constraint = within_percent_of_ideal_population(partition, percent=0.01)

    chain = MarkovChain(
        proposal,
        constraints=[contiguous, pop_constraint, no_worse_L_minus_1_polsby_popper],
        accept=accept.always_accept,
        initial_state=partition,
        total_steps=steps
    )

    return chain