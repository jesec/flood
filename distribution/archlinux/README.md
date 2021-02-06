# Flood as a pacman (.pkg) package

Tools used for installation: `pacman`

**flood**

`flood` folder contains a working `PKGBUILD`, inspired by [nodejs-yaml](https://github.com/archlinux/svntogit-community/blob/packages/nodejs-yaml/trunk/PKGBUILD) and [nodejs-nativefier](https://aur.archlinux.org/cgit/aur.git/tree/PKGBUILD?h=nodejs-nativefier). It uses Node.js runtime of system. It complies with Arch Linux package guidelines and should be suitable for submission to Arch Linux official repository.

A CI workflow automatically pushes new releases to AUR (Arch User Repository).

Note that checksum is not included in the file. Update it with `updpkgsums` when necessary.
