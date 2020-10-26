# RtD3js
React library for RtD3 R package.

## Description

Provides a JavaScript interface for the Rt visualisations in RtD3.

Written in [`React`](https://reactjs.org/), tested with [`jest`](https://jestjs.io/), built with [`webpack`](https://webpack.js.org/).

This library is intended to replace the current [`rt_vis`](https://github.com/hamishgibbs/rt_vis) library.

Transitioning from `rt_vis` to `RtD3js` should be straightforward, with few changes to the R interface for instantiating a widget.

## Motivation

There are a number of motivations for transitioning to a component framework like `React`. Primarily, `rt_vis` attempts to reproduce the behaviour of a `React` application without using a framework, which has led to lots of code duplication and a lack of clarity when defining components.

`React` adds easy reusability of various components, ease of testing, and a more reliable build workflow.

## Local development

This library is developed in the [`node`](https://hub.docker.com/_/node) docker container.

To get started developing this project locally, clone this repository and `cd` into the new directory.

To build the libraries docker image run:

``` {shell}
make build
```

To access a container interactively, run:

``` {shell}
make bash
```

To run unit tests in a container, run:

``` {shell}
make test
```

## Special considerations

Because this library will be used in an R package (an RStudio Viewer, R Markdown Document, or Shiny application), we have to rely on a single `.js` output, not a fully configured build process and development server. The stripped-down build process means less fancy syntax.

Primarily, `.jsx` syntax like `<h1>` and `</h1>` should be replaced with `React.createElement('h1', etc., ect.)`.
