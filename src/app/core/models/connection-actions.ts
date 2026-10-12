export const CONNECTION_ACTIONS = {
  resendInvite: 'Resending an invitation',
  revokeInvite: 'Revoking an invitation',
  setRole: 'Changing roles',
  removeMember: 'Removing a member',
  updateWorkspace: 'Saving workspace settings',
  setWorkspaceLogo: 'Changing the logo',
  setWsPref: 'Changing workspace settings',
  toggleRolePerm: 'Changing permissions',
  transferOwnership: 'Transferring ownership',
  archiveWorkspace: 'Archiving the workspace',
  deleteWorkspace: 'Deleting the workspace',
  cancelDeletion: 'Cancelling deletion',
  addToTeam: 'Adding people to a team',
  removeFromTeam: 'Removing people from a team',
  setTeamRole: 'Changing team roles',
  archiveTeam: 'Archiving a team',
  archiveChannel: 'Archiving a channel',
  unarchiveChannel: 'Unarchiving a channel',
  leaveChannel: 'Leaving a channel',
  rejoinChannel: 'Joining a channel',
  joinTeam: 'Joining or leaving a team',
  renameGroup: 'Renaming a group',
  addToGroup: 'Adding people to a group',
  removeFromGroup: 'Removing people from a group',
  leaveGroup: 'Leaving a group',
  edit: 'Editing a message',
  remove: 'Deleting a message',
  react: 'Reacting',
  pin: 'Pinning a message',
  removeTask: 'Deleting a task',
  removeFile: 'Deleting a file',
  renameFile: 'Renaming a file',
  toggleIntegration: 'Changing integrations',
  attachFiles: 'Attaching files',
  createTeam: 'Creating a team',
  editTeam: 'Changing team settings',
  createChannel: 'Creating a channel',
  editChannel: 'Editing a channel',
  createWorkspace: 'Creating a workspace',
  createGroup: 'Creating a group chat',
  addPeople: 'Adding people',
} as const satisfies Record<string, string>;

export type ConnectionAction = keyof typeof CONNECTION_ACTIONS;

export const OFFLINE_FORM_MESSAGE =
  'You’re offline — nothing was saved. Your changes are still in the form; try again when you’re back online';

export const needsConnectionMessage = (action: ConnectionAction): string =>
  `${CONNECTION_ACTIONS[action]} needs a connection — try again when you’re back online`;
