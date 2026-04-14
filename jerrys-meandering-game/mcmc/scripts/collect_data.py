import pandas as pd
from tqdm import tqdm

def collect_chain_data(chain, burn_in=1000, thin=10, total_steps=None):
    records = []
    assignments = []

    iterator = tqdm(enumerate(chain), total=total_steps, desc="Running ReCom Chain")

    for step, partition in iterator:
        if step < burn_in:
            continue

        if step % thin != 0:
            continue

        for district in partition["perimeter"].keys():
            records.append({
                "step": step,
                "district": district,
                "population": partition["population"][district],
                "perimeter": partition["perimeter"][district],
                "area": partition["area"][district],
                "polsby_popper": partition["polsby_popper"][district],
                "dem_votes": partition["dem_votes"][district],
                "rep_votes": partition["rep_votes"][district],
                "other_votes": partition["other_votes"][district]
            })
        assignments.append(partition.assignment.copy())

        iterator.set_postfix(samples=len(assignments))
    
    df = pd.DataFrame(records)
    return df, assignments