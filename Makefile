src = src
dst = dst

all:
	@mkdir -p $(dst)
	@find $(src) -name '*.js' -exec cat {} + > $(dst)/index.js
	@cp $(src)/index.html $(dst)/index.html

clean:
	@rm -rf $(dst)

watch:
	@echo "Watching for changes..."
	@fswatch -o $(src)/*.js --extended -e '^\.#.*' | xargs -n1 -I{} make

.PHONY: all
