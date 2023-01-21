# toolforge-docker-login
Logs in the local Docker client to a ToolForge Docker registry

## Table of Contents

- [Example of Usage](#example-of-usage)

## Example of Usage

### Building and pushing a ToolForge tool

```yaml
      - name: Checkout repo
        uses: actions/checkout@v3
      - id: toolforge-docker-login
        name: Login to ToolForge Docker
        uses: toolforgeio-actions/toolforge-docker-login@v1
        with:
          api-key: ${{ secrets.MY_TOOLFORGE_API_KEY }}
      - name: Build, tag, and push docker image to ToolForge Docker
        env:
          REGISTRY: ${{ steps.toolforge-docker-login.outputs.registry }}
          REPOSITORY: my-ecr-repo
        run: |
          docker build -t $REGISTRY/$REPOSITORY .
          docker push $REGISTRY/$REPOSITORY
```
