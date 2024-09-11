## QGDS Bootstrap 5 - Squiz DXP Component System

This library is for dxp.squiz.cloud to generate the required html structure to use the QGDS Bootstrap5 css/javascript.

There is two namespaces
* **qgds-bs5 (-dev)**: Used for WYSIWYG editor drag and drop components
* **qgds-bs5-layout (-dev)**: Used for page template embeds 

### Quick start

Use namespace and version on each component.

```bash
npm install
npm run serve
```
Go to http://localhost:3000


### Dev Deployment


```bash
npm run build
```

#### What does it do
* Overrides  namespace to qgds-bs5-dev

* Use package.json version + date/current time appended to end of version for per min to allow unique deployments into DXP CS


### Release Deployment

```bash
npm run release
```

#### What does it do
* To update namespace to qgds-bs5
* Use package.json version as manifest version


### Manifest spec

You can find the manifest spec in the [./spec](./spec) folder.

Please be aware one major restriction is that manifest version;
* It can't be longer than 14 characters.
* It can't have a number starting with 0, regex pattern is as follows:
  
  Regex: ``^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$``

  i.e. 1.0.0 is allowed, but 1.01.1 is not, 1.1.1 is valid but 1.2.120240921418 is too long

