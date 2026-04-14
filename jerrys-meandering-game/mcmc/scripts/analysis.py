import pandas as pd
import matplotlib.pyplot as plt

def add_vote_share(df):
    df = df.copy()

    df["total_votes"] = df["dem_votes"] + df["rep_votes"] + df["other_votes"]
    df["dem_share"] = df["dem_votes"] / df["total_votes"]

    print(min(df["polsby_popper"]), max(df["polsby_popper"]))
    print(df["polsby_popper"].mean(), df["polsby_popper"].std())

    return df

def compute_seats(df):
    seats = []

    grouped = df.groupby("step")

    for step, group in grouped:
        dem_seats = (group["dem_votes"] > group["rep_votes"]).sum()

        seats.append({
            "step": step,
            "dem_seats": dem_seats
        })

    return pd.DataFrame(seats)

def plot_seat_hist(seat_df):
    plt.hist(seat_df["dem_seats"], bins=range(seat_df["dem_seats"].min(),
                                               seat_df["dem_seats"].max() + 2),
             edgecolor="black")

    plt.xlabel("Democratic Seats")
    plt.ylabel("Number of Plans")
    plt.title("Distribution of Seat Outcomes")
    plt.show()

def plot_vote_share_hist(df):
    plt.hist(df["dem_share"], bins=30, edgecolor="black")

    plt.xlabel("Democratic Vote Share (District Level)")
    plt.ylabel("Frequency")
    plt.title("Distribution of District Vote Shares")
    plt.show()

