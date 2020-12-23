#
#
#

import os
from os.path import expanduser
import pickle
import json

from PIL import Image
from natsort.natsort import natsorted

#
# OPTIONS
# ---------------------------------------------------------------------

# The scripts for generating the following files can be found in https://github.com/cmann1/PropUtils/
# Download and run _extract_sprites_reference.py then change the path below:
HOME = expanduser('~') + '/Desktop/PropUtils'

# The generated reference data file (should not need to be changed)
SPRITE_DATA_FILE = HOME + '/sprites-reference-data'
# The path to the sprites folder generated by _create_sprite_reference_sheets.py (should not need to be changed)
SPRITES_PATH = HOME + '/reference_sprites'

# Where the sprite sheets will be saved to
OUT_DIR = '../assets/sprites'

FRAME_PADDING = 1
THUMB_SIZE = 42
GENERATE_IMAGE = True

#
# SETUP
# ---------------------------------------------------------------------

with open(SPRITE_DATA_FILE, 'rb') as f:
	sprite_sets_data = pickle.load(f)

os.makedirs(OUT_DIR, exist_ok=True)

#
# GENERATE
# ---------------------------------------------------------------------

sprites_out_data = []

for sprite_set, sprite_set_data in sprite_sets_data.items():
	# if sprite_set != 'dustkid':
		# if sprite_set != 'props6' and sprite_set != 'dustman':
		# continue

	if sprite_set == 'tile6':
		continue

	print('GENERATING SPRITE SET: ' + sprite_set)

	sprite_set_out_path = os.path.join(OUT_DIR, sprite_set)
	os.makedirs(sprite_set_out_path, exist_ok=True)

	sprite_set_src_path = os.path.join(SPRITES_PATH, sprite_set)

	sprite_set_out_data = []
	sprite_thumb_data = []

	for sprite_name, data in sprite_set_data.items():
		sprite_data = data['sprites'][-1]
		frame_count = sprite_data['frame_count']
		palette_count = sprite_data['palette_count']
		palettes = sprite_data['palettes']

		if frame_count == 0:
			continue

		sprite_set_out_data.append(dict(
			name=sprite_name,
			palettes=palette_count,
			frames=frame_count))

		print('  %s [p:%i f:%i]' % (sprite_name, palette_count, frame_count))

		# Calculate the size of the sprite sheet

		total_width = 0
		max_height = 0
		palette = palettes[0]
		for frame_index in range(frame_count):
			x, y, w, h = palette[frame_index]['rect']
			total_width += w + FRAME_PADDING
			max_height = max(max_height, h + FRAME_PADDING)

		if GENERATE_IMAGE:
			sheet_image = Image.new('RGBA', (total_width + FRAME_PADDING, max_height * palette_count + FRAME_PADDING), (0, 0, 0, 0))

		sprite_sheet_data = dict(
			palettes=[]
		)

		thumb_palette = 0
		thumb_frame = 0

		if sprite_set == 'fonts':
			thumb_frame = 50

		frame_y = 0
		for palette_index in range(palette_count):
			frame_x = 0
			palette = palettes[palette_index]

			palette_data = []
			sprite_sheet_data['palettes'].append(palette_data)

			for frame_index in range(frame_count):
				x, y, w, h = palette[frame_index]['rect']
				frame_path = os.path.join(sprite_set_src_path, '{}-{}-{:04d}.png'.format(sprite_name, palette_index + 1, frame_index + 1))

				sprite_frame_x = frame_x + FRAME_PADDING
				sprite_frame_y = frame_y + FRAME_PADDING

				if not os.path.exists(frame_path):
					print('ERROR: cannot open file %s' % frame_path)

				if GENERATE_IMAGE:
					if os.path.exists(frame_path):
						frame_image = Image.open(frame_path)
						sheet_image.paste(frame_image, (sprite_frame_x, sprite_frame_y))

						if palette_index == thumb_palette and frame_index == thumb_frame:
							sprite_thumb_data.append((sprite_name, frame_image))
					else:
						print('ERROR: cannot open file %s' % frame_path)

				palette_data.append((sprite_frame_x, sprite_frame_y, w, h, x, y))

				frame_x += w + FRAME_PADDING
				pass

			frame_y += max_height
			pass

		if GENERATE_IMAGE:
			sheet_image.save('%s/%s.png' % (sprite_set_out_path, sprite_name), optimize=True, compress_level=9)
			sheet_image.close()

		with open('%s/%s.json' % (sprite_set_out_path, sprite_name), 'w') as f:
			json.dump(sprite_sheet_data, f, indent='\t')

		pass

	sprite_set_out_data = natsorted(sprite_set_out_data, key=lambda item: item['name'])
	sprites_out_data.append(dict(name=sprite_set, sprites=sprite_set_out_data))

	# Generate thumbnails

	if GENERATE_IMAGE:
		thumb_sheet = Image.new('RGBA', (len(sprite_set_data) * THUMB_SIZE, THUMB_SIZE), (0, 0, 0, 0))
		sprite_thumb_data = natsorted(sprite_thumb_data, lambda x: x[0])
		thumb_x = 0
		group_first = True

		for sprite_name, thumb_image in sprite_thumb_data:
			thumb_image.thumbnail((THUMB_SIZE, THUMB_SIZE))
			thumb_w, thumb_h = thumb_image.size
			thumb_sheet.paste(thumb_image, (thumb_x + int((THUMB_SIZE - thumb_w) / 2), int((THUMB_SIZE - thumb_h) / 2)))
			thumb_x += THUMB_SIZE

			if group_first:
				group_thumb_image = Image.new('RGBA', (THUMB_SIZE, THUMB_SIZE), (0, 0, 0, 0))
				group_thumb_image.paste(thumb_image, (int((THUMB_SIZE - thumb_w) / 2), int((THUMB_SIZE - thumb_h) / 2)))
				group_thumb_image.save('%s/_group_thumb.png' % sprite_set_out_path, optimize=True, compress_level=9)
				group_thumb_image.close()
				group_first = False

			thumb_image.close()

		thumb_sheet.save('%s/_thumb.png' % sprite_set_out_path, optimize=True, compress_level=9)
		thumb_sheet.close()

	pass

sprites_out_data = natsorted(sprites_out_data, lambda x: x['name'])
with open('%s/sprites.json' % OUT_DIR, 'w') as f:
	json.dump(sprites_out_data, f, indent='\t')
