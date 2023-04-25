<h1 align="center">
    <img src="../img/install.svg" width=200 />
    <br>
    Installation instructions
</h1>

## Technical Requirements

Before installing your own Warp Core instance, you must install [Node.js](https://nodejs.org/en/download) in any version you want. You can check your current Node.js version by using the following command:

```sh
npm -v
```

## Install required packages

For the first step, clone the existing repository:

```sh
git clone https://github.com/Space-Game-Engine/Warp-Core.git
```

When the cloning process is complete, go to the `Warp Core` folder and install the required packages:

```sh
npm install
```

Wait until the installation process is complete. Then, you have to install the database driver (if you want to stick with the default SQLite, you can skip this point). Detailed instructions can be found on the [TypeORM installation website](https://typeorm.io/#installation).
**AT THIS POINT YOU SHOULD INSTALL DATABASE DRIVER AS GLOBAL MODULE.** In the future, `Warp Core` will be separated Node.js module and additional packages will be installed locally.

## Prepare local instance environment variables

Go to the `config` folder, copy the `localhost.yaml.dist` file, and save it as `localhost.yaml`. Then, fill in the fields related to the database or remove them completely to use the local SQLite database. The database type can be one of the following values: mysql, mariadb, postgres, cockroachdb, sqlite, mssql, sap, spanner, oracle, mongodb, cordova, react-native, expo, or nativescript (depending on the driver you have installed).

Next, go to the `install` folder, copy all `*.template.yaml` files, and save them without the `template` part. These files contain all crucial parameters that are relevant to the game experience. You can find more details on how to customize these files here: [Installation templates description](installation-templates-description.md).

## Load database and prepare for launch

In this part, we want to prepare our database and upload all configured game parameters there. `Warp Core` has a built-in tool to install all required values. In the root game folder (the same place where `package.json` is located), type the following command in the console:

```sh
npm run install-game
```

## Start game instance

Now it's time to launch your `Warp Core` instance! You can do it in three ways:

### Developer mode

In this mode, every code change triggers the application to recompile and restart.

```sh
npm run start:dev
```

### Compilation mode

In this mode, the entire project is compiled from Typescript, and a local server instance is launched.

```sh
npm run start
```

### Production mode

In this mode, the game is ready to use quickly. Everything is compiled once, and then you can just launch the ready-to-use code using node.

```sh
npm run build
npm run start:prod
```

## Check if game is loading

When everything is fine, and game have loaded correctly, you will see NestJS output in console. On the two bottom lines you will see URLs, one is for GraphQL interface, second will show you local documentation page. Go ahead and use them to check if everything loads as it should.

*And that's all!* Happy gaming 🚀 and go to [First steps](/docs/first_steps.md) to see how to authenticate and create new user.
