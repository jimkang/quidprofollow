test:
	node tests/basictests.js

test-functional: config.js
	node tests/functionaltest.js

pushall:
	git push origin master && npm publish
