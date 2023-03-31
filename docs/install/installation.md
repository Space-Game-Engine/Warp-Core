<h1 align="center">
    <img src="../img/install.svg" width=200 />
    <br>
    Installation instructions
</h1>

## Technical Requirements

Before installing your own Warp Core instance, you must install [NodeJs](https://nodejs.org/en/download) in version 16. You can check your current Node version by using command.

```sh
npm -v
```

## Install required packages

At first step, clone existing repository.

```sh
git clone https://github.com/Space-Game-Engine/Warp-Core.git
```

When the cloning process is complete, go to `Warp Core` folder and install required packages.

```sh
npm install
```

Wait until installation process is complete. Then you have to install database driver (if you want to stay with default SQLite, you can skip that point). Detailed instruction can be found at [TypeORM installation website](https://typeorm.io/#installation).

## Prepare local instance environment variables

Go to `config` folder, copy `localhost.yaml.dist` file and save it as `localhost.yaml`. Then fill fields related to database or remove them completely to use local SQLite database.  
Database type can be one of the following values: mysql, mariadb, postgres, cockroachdb, sqlite, mssql, sap, spanner, oracle, mongodb, cordova, react-native, expo, nativescript (depends on what driver you have installed).

Then, go to `install` folder, copy all `*.template.yaml` files and save them without `template` part. That files contains all crucial parameters that are relevant to game experience. You can find more details on how to customize that files here: [Installation templates description](installation-templates-description.md).

## Load database and prepare for launch

In that part we want to prepare our database and to upload all configured game parameters there. `Warp Core` have build in tool to install all required values. In root game folder (same place as `package.json` is placed) type in console

```sh
npm run install-game
```

## Start game instance

Now it is time to launch your `Warp Core` instance! You can do it in three ways

### Developer mode

In that mode, every code change triggers restarting application.

```sh
npm run start:dev
```

### Compilation mode

That mode compile whole project from Typescript and launch local sever instance

```sh
npm run start
```

### Production mode

That mode is the fastest way to use game. It compiles everything once and then you just launch ready to use code by node.

```sh
npm run build
npm run start:prod
```

*And that's all!* Happy gaming 🚀
