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

    new <dir> [base]              Create a new theme, based on Core by default.

        --name                    Specify a unique package name.
                                  (Defaults to directory name).

        --friendly-name           Specify a display name for administrator.
                                  (Defaults to directory name).

    override <path>               Create an override, copying from base theme.

        --force                   Force creation even if a file already exists.

    check <path>                  Check if references are up to date.

    update <path>                 Update references folder.

```

