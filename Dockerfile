FROM node:16-bullseye

################################
# (optional) CONFIGURE AT BUILD TIME:
#   Example: `docker build --build-arg APP_VERSION=(version) (...)`

# Version or branch name that that the container will be labeled with
ARG ENV_APP_VERSION="not set"
ENV APP_VERSION=${ENV_APP_VERSION}

# GitHub SHA that this was built from
ARG ENV_APP_COMMIT="SHA not set"
ENV APP_COMMIT=${ENV_APP_COMMIT}
################################

# Copy this directory into /app and set as working directory
COPY . /app
WORKDIR /app

# Get cache of Debian packages
RUN apt-get update

# Install SpatiaLite
RUN apt-get install -y libsqlite3-mod-spatialite

# Install Python requirements
# RUN pip install -r requirements.txt

# Command run when container launches
CMD echo "Running from your built container at version/branch: ${APP_VERSION}"