# Flood as a Debian (.deb) package

Tools used for installation: `apt`, `dpkg`

**flood**

`flood` folder is a proper `debian` directory structure that is created with the existing policies of Debian in mind.

However, the maintainer of this project determined, with hours of reading of Debian policies and documentations, that it is out-of-scope for this project to maintain a "proper" Debian package that is suitable for submission to Debian official repository. The primary issues are: the large dependency tree and too old Node.js runtime shipped.

No continuous integration is planned.

However, the contents serve as a good example and starting point if you wish to package Flood for inclusion in official repository of Debian.
