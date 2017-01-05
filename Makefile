node_modules: package.json
	rm -rf node_modules && npm install

lint: # run linting.
	npm run lint
