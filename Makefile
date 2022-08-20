src = src
dst = dst

all:
	@mkdir -p $(dst)
	@find $(src) -name '*.js' -exec cat {} + > $(dst)/index.js
	@cp $(src)/index.html $(dst)/index.html
	@echo "Built"

clean:
	@rm -rf $(dst)

watch:
	@echo "Watching for changes..."
	@fswatch $(src)/js:$(src)/html --extended -e '^\.#.*' | xargs -n1 -I{} make

.PHONY: all
