import pandas as pd
from scripts.plot import plot_partition_to_array
from tqdm import tqdm

def collect_chain_data(chain, burn_in=1000, thin=10, total_steps=None):
    frames = []
    records = []

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
                "polsby_popper": partition["polsby_popper"][district]
            })
        frames.append(plot_partition_to_array(partition))

        iterator.set_postfix(samples=len(frames))
    
    df = pd.DataFrame(records)
    return df, frames