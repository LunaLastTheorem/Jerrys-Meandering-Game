from gerrychain import MarkovChain
import matplotlib.pyplot as plt

import io
import pandas as pd
from PIL import Image

class Recom:
    def __init__(self, graph, initial_partition, proposal, constraints, accept, total_steps):
        self.graph = graph
        self.initial_partition = initial_partition
        self.proposal = proposal
        self.constraints = constraints
        self.accept = accept
        self.total_steps = total_steps
    
    def run_chain(self):
        recom_chain = MarkovChain(
            self.proposal,
            constraints=self.constraints,
            accept=self.accept,
            initial_state=self.initial_partition,
            total_steps=self.total_steps,
        )
        return recom_chain
    
    def display_initial_partition(self):
        _, ax = plt.subplots(figsize=(8,8))
        ax.set_yticks([])
        ax.set_xticks([])
        ax.set_title("Initial Partition in UT")
        self.initial_partition.plot(ax=ax, cmap='tab20c')
        plt.show()
    
    def collect_chain_data(self, recom_chain):
        frames = []
        district_data = []
        for i, partition in enumerate(recom_chain):
            for district_name in partition.perimeter.keys():
                population = partition.population[district_name]
                perimeter = partition.perimeter[district_name]
                area = partition.area[district_name]
                district_data.append((i, district_name, population, perimeter, area))

            buffer = io.BytesIO()
            fig, ax = plt.subplots(figsize=(10,10))
            partition.plot(ax=ax, cmap='tab20')
            ax.set_xticks([])
            ax.set_yticks([])
            plt.savefig(buffer, format='png', bbox_inches='tight')
            buffer.seek(0)
            image = plt.imread(buffer)
            frames.append(image)
            plt.close(fig)

        df = pd.DataFrame(
            district_data,
            columns=[
                'step',
                'district_name',
                'population',
                'perimeter',
                'area'
            ]
        )
        return df, frames
    
    def save_gif(self, frames, filename):
        pil_frames = [Image.fromarray((frame * 255).astype('uint8')) for frame in frames]

        pil_frames[0].save(
            filename,
            save_all=True,
            append_images=pil_frames[1:], # skip first image (initial partition)
            duration=500,  # adjust speed (ms per frame)
            loop=0
        )

