# Reflection
Screenshot taking API built on top of Node(+ Express) and Phantom.

## Usage

`GET /?[width=<n_pixels>]&[height=<n_pixels>]&url=http[s]://<deployment>.opengov.com/<path>`

The request Responds with PNG image data for the screenshot that was requested.  A `Content-Disposition` header is included in the response so that a browser prompts the user to download the file.
	
### Defaults

* width: 960
* height: 640

## Author
Claudiu Andrei

## Maintainer
Loren Abrams

### (C) Copyright 2013, [OpenGov](http://opengov.com)
