src = src
dst = dst

all:
	@mkdir -p $(dst)
	@find $(src) \( -name '*.js' ! -iname '.*' \) -exec cat {} + > $(dst)/index.js
	@cp $(src)/index.html $(dst)/index.html
	@echo "Built"

clean:
	@rm -rf $(dst)

watch:
	@echo "Watching for changes..."
	@fswatch -o $(src) --extended --exclude '^\.#.*' | xargs -n1 -I{} make

.PHONY: all
