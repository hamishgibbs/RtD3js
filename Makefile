build:
	docker build -t rtd3js .

bash:
	docker run -it --rm --mount type=bind,source=${PWD},target=/usr/RtD3js/ rtd3js bash

test:
	docker run -it --rm --mount type=bind,source=${PWD},target=/usr/RtD3js/ rtd3js npm run test
