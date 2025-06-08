# Image Gallery

This repository contains the source code for our sports club's image gallery.
It is built using [Hugo](https://gohugo.io/), a fast and flexible static site generator.

## Getting Started

### Prerequisites

- Install [Hugo Extended](https://gohugo.io/getting-started/installing/).
- Install [Node] and [NPM](https://nodejs.org/en/download/).

Afterwards, install the dependencies: `npm i`.

### Configuration

Create an environment file (`.env`) according to the example file (`.env.schema`).
To work with remote storage, you need to set `AZURE_STORAGE_CONNECTION_STRING` and `AZURE_STORAGE_CONTAINER_NAME` in the `.env` file.

To work with local files, set `params.remote.enabled` to `false` in `hugo.toml`.

```toml
[params]
  [params.remote]
    enabled = false
```

### Build the Site

To run the site locally, just run: `npm run dev`.

This command will generate a list of images and start the Hugo development server.

## Creating Content

Create new album (collection of albums/galleries):
```sh
hugo new content -k album <album_path>
# for example:
hugo new content -l album animals
```

Create new gallery (collection of images):
```sh
hugo new content -k gallery <gallery_path>/index.md
# for example:
hugo new content -l gallery animals/birds/index.md
```

## Uploading Images

To upload images to remote storage, use `npm run upload`.

This command will upload images from the `images` directory to the configured remote storage.
Files are uploaded to the same relative paths as they are in the `images` directory.
Existing files will be overwritten.
