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
                                                                                         
  check <path>                            Check if references are up to date.
                                          
    --all                                 Check all supported versions of the Core t
                                          heme instead of just the one this theme ex
                                          tends.
                                          
    --no-cache                            Skip the local cache. This results in a ca
                                          ll out to the remote repository every time
                                          , instead of every day.

  compile <path>                          Compile theme scripts, respecting inherita
                                          nce.                                          
    --ignore                              Speed up! Specify a pattern of files and d
                                          irectories to ignore when copying, relativ
                                          e to root. Defaults to .git, node_modules
                                          
    --dest                                Specify a destination other than the defau
                                          lt /compiled/scripts directory of your the
                                          me.
                                          
    --verbose                             Talk a lot.

                                          
    --quiet                               Don't talk at all.


  help                                    Print this help
                                          
    --splash                              Display a fancy logo.

                                          
    --forcewidth <n>                      Force display at a certain number of colum
                                          ns. Defaults to terminal width.

  new <path>                              Create a new theme based on the Core theme
                                          .                                          
    --name                                Specify a unique package name. (Defaults t
                                          o directory name.)
                                          
    --friendly-name                       Specify a display name for SiteBuilder. (D
                                          efaults to directory name.)

  override <path>                         Create an override, copying from your base
                                           theme.                                          
    --force                               Force overwrite if an override already exi
                                          sts.

  set-version <path> <version>            Set and synchronize the version number acr
                                          oss all config files.                                          
    --no-package                          Do not update package.json.

                                          
    --no-bower                            Do not update bower.json.


  update <path>                           Update references folder.
                                          
    --all                                 Download all versions of the Core theme in
                                          stead of just the version this theme exten
                                          ds.


```

