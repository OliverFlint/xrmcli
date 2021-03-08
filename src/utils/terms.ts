export const terms = {
  d365: 'D365/Dataverse',
  AAD: 'Azure Active Directory',
  AuthHelp: `
When providing credentials you must provide in the following pairs:

  For username and password authentication:
    '-n, --username <username>' is required
    '-p, --password <password>' is required
    '-c, --clientid <clientid>' is optional

  For client secret authentication:
    '-c, --clientid <clientid>' is required
    '-cs, --secret <secret>' is required
    `,
};
export default terms;
