# Theme Helper for Mozu and Associated Assets
!["thmaa" copyright john "derf" backderf, 1997](https://cloud.githubusercontent.com/assets/1643758/5307264/17d153f4-7bd1-11e4-8bbb-951ca191b903.jpg)

Command-line toolbelt for common tasks involving Mozu themes.

## Requires
 - nodejs 0.10 or above
 - git
   - *Note: If using on Windows, remember to install Git to be used at the Windows cmd.exe command line, as well as Git-Bash.*

## Install
```
npm install -g thmaa
```

## Usage
```
                                                                                                                                                     
  Theme Helper for Mozu and Associated Assets                                                                                                        
                                                                                                                                                     
  If you don't supply a <path> to a command, thmaa will assume the current directory.                                                                
                                                                                                                                                     
  check <path>                                                          Check if references are up to date.

  compile <path>                                                        Compile theme scripts, respecting inheritance.
                                                                        
    --ignore                                                            Speed up! Specify a pattern of files and directories to ignore when copy
                                                                        ing, relative to root. Defaults to .git, node_modules
                                                                        
    --dest                                                              Specify a destination other than the default /compiled/scripts directory
                                                                         of your theme.
                                                                        
    --verbose                                                           Talk a lot.

                                                                        
    --quiet                                                             Don't talk at all.


  help                                                                  Print this help
                                                                        
    --splash                                                            Display a fancy logo.


  new <path>                                                            Create a new theme based on the Core theme.
                                                                        
    --name                                                              Specify a unique package name. (Defaults to directory name.)

                                                                        
    --friendly-name                                                     Specify a display name for SiteBuilder. (Defaults to directory name.)


  override <path>                                                       Create an override, copying from your base theme.
                                                                        
    --force                                                             Force overwrite if an override already exists.


  set-version <path> <version>                                          Set and synchronize the version number across all config files.
                                                                        
    --no-package                                                        Do not update package.json.

                                                                        
    --no-bower                                                          Do not update bower.json.


  update <path>                                                         Update references folder.


```

