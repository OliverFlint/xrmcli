interface IWebresource {
  name: string;
  displayname: string;
  description: string;
  path: string;
  type: string;
}
export default interface IWebresourceConfig {
  WebResources: IWebresource[];
}
