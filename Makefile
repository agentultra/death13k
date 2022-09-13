src = src
dst = dst

all:
	@mkdir -p $(dst)
	@find $(src) \( -name '*.js' ! -iname '.*' \) -exec cat {} + > $(dst)/index.js
	@cp $(src)/index.html $(dst)/index.html
	@cp test-sprite.png $(dst)/test-sprite.png
	@cp hitHurt.wav $(dst)/hitHurt.wav
	@cp pickupCoin.wav $(dst)/pickupCoin.wav
	@cp steal.wav $(dst)/steal.wav
	@echo "Built"

clean:
	@rm -rf $(dst)

watch:
	@echo "Watching for changes..."
	@fswatch -o $(src) --extended --exclude '^\.#.*' | xargs -n1 -I{} make

.PHONY: all
