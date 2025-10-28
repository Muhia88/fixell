SHELL := /bin/bash

.PHONY: test ci

#Run tests with PYTHONPATH set 
test:
	PYTHONPATH=$(PWD) pytest

ci:
	PYTHONPATH=$(PWD) pytest -q
