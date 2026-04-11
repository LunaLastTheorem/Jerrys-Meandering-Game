import matplotlib.pyplot as plt
import io

def plot_partition_to_array(partition):
    buffer = io.BytesIO()

    fig, ax = plt.subplots(figsize=(8,8))
    partition.plot(ax=ax, cmap='tab20')

    ax.set_xticks([])
    ax.set_yticks([])

    plt.savefig(buffer, format='png', bbox_inches='tight')
    buffer.seek(0)

    image = plt.imread(buffer)
    plt.close(fig)

    return image