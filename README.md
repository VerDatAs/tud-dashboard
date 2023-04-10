# VerDatAs Dashboard

The dashboard contains:

* an ILIAS plugin implemented as a page component (located in the `plugin` folder) and
* an application realizing the actual dashboard functionality (located in the `dashboard` folder), whose build is moved as a template in the plugin.

## Docker

For the delivery of the plugin code with the built dashboard a Docker image is used. This image can be built by executing:

```bash
docker build -t docker.rn.inf.tu-dresden.de/verdatas/verdatas-dashboard:latest .
```

Within this image the code is located in the `/app` directory.