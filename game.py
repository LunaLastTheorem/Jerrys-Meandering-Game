import pygame

# Define some colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)

# Initialize Pygame
pygame.init()

# Set up the game window
size = (255, 255)
screen = pygame.display.set_mode(size)

# Grid settings
width = 20
height = 20
margin = 5 # this is margin between each box and edges of screen

pygame.display.set_caption("Super Cool and Awesome Game")

done = False

clock = pygame.time.Clock() # apparently controls how fast the screen updates

# Main Loop
while not done:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            done = True
    
    # --- Game logic here

    # --- Screen-clearing code goes here

    # We clear the screen to white. DO NOT put other drawing commands
    # above this, or they WILL be erased with this command.
    # If you want a background image, replace this clear with blit'ing
    # background image.
    screen.fill(BLACK)

    # --- Drawing code should go here
    for column in range(10):
        for row in range(10):
            pygame.draw.rect(screen, WHITE, [(margin + width) * column + margin, (margin + height) * row + margin, width, height], 0)

    # --- Go ahead and update the screen with what we've drawn
    pygame.display.flip()

    # --- Limit 60 frames per second
    clock.tick(60)

# Quit Pygame
pygame.quit()