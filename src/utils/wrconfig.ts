export default interface IWebresourceConfig {
  WebResources: IWebresource[];
}

interface IWebresource {
  name: string;
  displayname: string;
  description: string;
  path: string;
  type: string;
}
