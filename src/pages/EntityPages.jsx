import React from 'react';
import { EntityPage } from './EntityPage';

export const Songs = (props) => <EntityPage entityKey="songs" {...props} />;
export const Artists = (props) => <EntityPage entityKey="artists" {...props} />;
export const Albums = (props) => <EntityPage entityKey="albums" {...props} />;
export const Playlists = (props) => <EntityPage entityKey="playlists" {...props} />;
export const Podcasts = (props) => <EntityPage entityKey="podcasts" {...props} />;
export const Episodes = (props) => <EntityPage entityKey="episodes" {...props} />;
export const Creators = (props) => <EntityPage entityKey="creators" {...props} />;
export const Users = (props) => <EntityPage entityKey="users" {...props} />;
export const Subscriptions = (props) => <EntityPage entityKey="subscriptions" {...props} />;
export const Payments = (props) => <EntityPage entityKey="payments" {...props} />;
export const Devices = (props) => <EntityPage entityKey="devices" {...props} />;
