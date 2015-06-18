# Theme Helper for Mozu and Associated Assets
!["thmaa" copyright john "derf" backderf, 1997](https://cloud.githubusercontent.com/assets/1643758/5307264/17d153f4-7bd1-11e4-8bbb-951ca191b903.jpg)

Command-line toolbelt for common tasks involving Mozu themes.

## Requires
 - nodejs 0.12 or above

## Install
```
npm install thmaa
```

## API
All command line options are also available via a Node API.
```
var thmaa = require('thmaa');
thmaa('check', process.cwd(), callback).on('info', console.log);
```


## Install Command Line Utility
```
npm install -g thmaa
```


## Command Line Usage