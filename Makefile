test:
	node tests/basictests.js

test-functional: config.js
	node tests/functionaltest.js
