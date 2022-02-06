[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/oliverflint/xrmcli/Build?logo=github&style=flat-square)](https://github.com/OliverFlint/xrmcli/actions/workflows/Build.yml)
[![npm](https://img.shields.io/npm/v/xrmcli?logo=npm&style=flat-square)](https://www.npmjs.com/package/xrmcli)
[![GitHub issues](https://img.shields.io/github/issues/oliverflint/xrmcli?logo=github&style=flat-square)](https://github.com/OliverFlint/xrmcli/issues)
[![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/oliverflint/xrmcli?logo=snyk&style=flat-square)](https://app.snyk.io/org/oliverflint/project/bedbb9d7-a289-41b3-be0f-a91e6bb39ae8)
![GitHub Repo stars](https://img.shields.io/github/stars/oliverflint/xrmcli?logo=github&style=flat-square)
![GitHub forks](https://img.shields.io/github/forks/oliverflint/xrmcli?logo=github&style=flat-square)

# XrmCli

A suite of cli tools to support Xrm/D365/Dataverse development

## Install

```
npm install xrmcli -g
```

## Usage

### Commands

```
Usage: xrmcli [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  data            perform data commands
  publish         publish customizations
  solution        solution commands e.g. import, export, ...
  code            create new code projects
  help [command]  display help for command
```

| Command  | Sub command | Description                                                                                                     |
| -------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| data     | create      | Create a record                                                                                                 |
|          | read        | Read record(s)                                                                                                  |
|          | update      | Update a record (incl. upsert)                                                                                  |
|          | delete      | Delete a record                                                                                                 |
|          | export      | Export record(s)                                                                                                |
|          | import      | Import record(s)                                                                                                |
| publish  | all         | Publishes all changes to solution components                                                                    |
|          | some        | Publishes specified solution components                                                                         |
| solution | export      | Exports a solution                                                                                              |
|          | import      | Imports a solution                                                                                              |
|          | patch       | Creates a solution patch from a managed or unmanaged solution                                                   |
|          | clone       | Creates a new copy of an unmanaged solution that contains the original solution plus all of its patches         |
| code     | typescript  | Creates a new typescript webresource project with different compiler/transpiler options (tsc, esbuild, webpack) |
