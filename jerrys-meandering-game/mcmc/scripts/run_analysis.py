from pathlib import Path
import pandas as pd

from scripts.analysis import (
    add_vote_share,
    compute_seats,
    plot_seat_hist,
    plot_vote_share_hist
)

def main():
    output_directory = Path(__file__).parent.parent / "outputs"

    # load df
    df = pd.read_csv(output_directory / "06_ns_contiguity_pop_pp.csv")

    df = add_vote_share(df)

    seat_df = compute_seats(df)

    plot_seat_hist(seat_df)
    plot_vote_share_hist(df)

if __name__ == "__main__":
    main()