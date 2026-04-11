from PIL import Image

def save_gif(frames, filename):
    pil_frames = [
        Image.fromarray((frame * 255).astype('uint8')) for frame in frames
    ]

    pil_frames[0].save(
        filename,
        save_all=True,
        append_images=pil_frames[1:],
        duration=500, 
        loop=0
    )