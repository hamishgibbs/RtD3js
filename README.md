# RtD3js
React library for the [`RtD3`](https://github.com/epiforecasts/RtD3) R package.

View the development version of this library: https://hamishgibbs.github.io/RtD3js/dist/

## Description

Provides a JavaScript interface for Rt visualisations in RtD3. Written in [`React`](https://reactjs.org/), tested with [`jest`](https://jestjs.io/), built with [`webpack`](https://webpack.js.org/).

This library is intended to replace the current [`rt_vis`](https://github.com/hamishgibbs/rt_vis) library.

Transitioning from `rt_vis` to `RtD3js` should be straightforward, with few changes to the R interface for instantiating a widget.

## Motivation

There are a number of motivations for transitioning to a component framework like `React`. Primarily, `rt_vis` attempts to reproduce the behaviour of a `React` application without using a framework, which has led to lots of code duplication and a lack of clarity when defining components.

`React` adds easy reusability of various components, ease of testing, greater maintainability, and a more reliable build workflow.

## New Features

* User supplied arbitrary value confidence intervals
* User supplied map legends and colors
  * Qualitative palette
  * Sequential palette (probably supports any named [here](https://github.com/d3/d3-scale))
* User supplied map projection (any named [here](https://github.com/d3/d3-geo#projections))
* User supplied timeseries colors
* Zoomable time series plots
* Zoomable map
* Extensible for future widgets

## Local development

This library is developed in the [`node`](https://hub.docker.com/_/node) docker container.

To get started developing this project locally, clone this repository and `cd` into the new directory.

To build the library's docker image run:

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

To watch files for changes during development, enter the container and run:

``` {shell}
npm run watch
```

## Special considerations

Because this library will be used in an R package (an RStudio Viewer, R Markdown Document, or Shiny application), we have to rely on a single `.js` output, not a fully configured build process and development server. The stripped-down build process means less fancy syntax.

`.jsx` syntax like `<h1>` and `</h1>` should be replaced with `React.createElement('h1', etc., ect.)`.

*2020-10-27 This has been solved with `babel-loader`. `.jsx` syntax now works fine.*


