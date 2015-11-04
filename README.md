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
```

                                                                                         
  Theme Helper for Mozu and Associated Assets                                            
                                                                                         
                                                                                         
  The <path> parameter defaults to the current directory.                                
                                                                                         
  check <path>                            Check for new versions of the base theme..

  compile <path>                          Compile theme scripts, respecting 
                                          inheritance.
                                          
    --ignore                              Speed up! Specify a pattern of files and 
                                          directories to ignore when copying, 
                                          relative to root. Defaults to ".git, 
                                          node_modules"
                                          
    --dest                                Specify a destination other than the 
                                          default /compiled/scripts directory of 
                                          your theme.
                                          
    --verbose                             Talk a lot.

                                          
    --quiet                               Don't talk at all.


  help                                    Print this very message
                                          
    --splash                              Display a fancy logo.

                                          
    --forcewidth <n>                      Force display at a certain number of 
                                          columns. Defaults to terminal width.

  update <path>                           Update base theme in references folder.
                                          
    --no-cache                            Skip the local cache. This results in a 
                                          call out to the remote repository every 
                                          time, instead of relying on cache.


```

