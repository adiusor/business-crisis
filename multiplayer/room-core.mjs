// Pure, server-owned room state. Never ship host/player credential hashes to clients.
export const MAX_PLAYERS = 30; // Upper input bound, NOT a load-tested capacity claim.
const BAD = (status, message) => Object.assign(new Error(message), {status});
const requireState = (condition, status, message) => { if (!condition) throw BAD(status, message); };
const clone = x => JSON.parse(JSON.stringify(x));

export function createRoom({code, hostHash, teamNames}) {
  requireState(typeof code === "string" && /^[A-F0-9]{12}$/.test(code), 400, "Invalid room code");
  requireState(typeof hostHash === "string" && /^[a-f0-9]{64}$/.test(hostHash), 400, "Invalid host credential");
  requireState(Array.isArray(teamNames) && teamNames.length >= 2 && teamNames.length <= 4, 400, "Use 2–4 teams");
  const names = teamNames.map(x => typeof x === "string" ? x.trim() : "");
  requireState(names.every(x => x.length >= 1 && x.length <= 32) && new Set(names.map(x => x.toLocaleLowerCase("en"))).size === names.length, 400, "Teams require unique names (1–32 characters)");
  return {version: 1, code, hostHash, phase: "lobby", round: 0, revision: 0,
    teams: names.map(name => ({name, captainId: null, advisers: [], locked: false})), players: []};
}

export function authorize(room, credentialHash) {
  requireState(room && room.version === 1 && typeof credentialHash === "string" && /^[a-f0-9]{64}$/.test(credentialHash), 401, "Unauthorized");
  if (credentialHash === room.hostHash) return {role: "host"};
  const p = room.players.find(x => x.credentialHash === credentialHash);
  requireState(!!p, 401, "Unauthorized");
  return {role: "player", playerId: p.id};
}

export function joinRoom(room, {nickname, teamIndex, credentialHash, playerId}) {
  requireState(room.phase === "lobby", 409, "Room already started; late joining is not enabled");
  requireState(room.players.length < MAX_PLAYERS, 409, "Room join limit reached");
  requireState(Number.isInteger(teamIndex) && teamIndex >= 0 && teamIndex < room.teams.length, 400, "Invalid team");
  const nick = typeof nickname === "string" ? nickname.trim() : "";
  requireState(nick.length >= 1 && nick.length <= 24, 400, "Nickname must contain 1–24 characters");
  requireState(!room.players.some(p => p.nickname.toLocaleLowerCase("en") === nick.toLocaleLowerCase("en")), 409, "Nickname already taken");
  requireState(typeof credentialHash === "string" && /^[a-f0-9]{64}$/.test(credentialHash) && credentialHash !== room.hostHash &&
    !room.players.some(p => p.credentialHash === credentialHash), 400, "Invalid participant credential");
  requireState(typeof playerId === "string" && /^[\w-]{8,64}$/.test(playerId) &&
    !room.players.some(p => p.id === playerId), 400, "Invalid participant ID");
  const next = clone(room);
  const player = {id: playerId, nickname: nick, teamIndex, credentialHash};
  next.players.push(player);
  if (!next.teams[teamIndex].captainId) next.teams[teamIndex].captainId = playerId;
  next.revision++;
  return next;
}

export function applyRoomAction(room, actor, command) {
  requireState(command && typeof command === "object" && !Array.isArray(command), 400, "Invalid command");
  requireState(Number.isInteger(command.expectedRevision) && command.expectedRevision === room.revision, 409, "Room changed; refresh state and retry");
  const next = clone(room);
  const isHost = actor && actor.role === "host";
  const player = !isHost && actor && actor.role === "player" && next.players.find(p => p.id === actor.playerId);
  const type = command.type;
  if (type === "start") {
    requireState(isHost, 403, "Only the host can start");
    requireState(next.phase === "lobby", 409, "Room already started");
    requireState(next.teams.every(t => t.captainId), 409, "Each team needs a participant");
    next.phase = "advisers";
  } else if (type === "select_advisers" || type === "lock_advisers") {
    requireState(!!player, 403, "Only a participant can select advisers");
    requireState(next.phase === "advisers", 409, "Adviser selection is closed");
    const team = next.teams[player.teamIndex];
    requireState(team.captainId === player.id, 403, "Only your team's captain can confirm selections");
    requireState(!team.locked, 409, "This team's advisers are locked");
    if (type === "select_advisers") {
      const picks = command.advisers;
      requireState(Array.isArray(picks) && picks.length === 2 && picks.every(x => Number.isInteger(x) && x >= 0 && x < 6)
        && new Set(picks).size === 2, 400, "Choose exactly two different advisers");
      team.advisers = picks.slice();
    } else {
      requireState(team.advisers.length === 2, 409, "Choose two advisers first");
      team.locked = true;
    }
  } else if (type === "advance") {
    requireState(isHost, 403, "Only the host can advance");
    requireState(next.phase === "advisers", 409, "Room is not awaiting choices");
    requireState(next.teams.every(t => t.locked), 409, "Not every team has locked its advisers");
    if (next.round === 5) {
      next.phase = "complete";
    } else {
      next.round++;
      next.teams.forEach(t => { t.advisers = []; t.locked = false; });
    }
  } else {
    throw BAD(400, "Unknown command");
  }
  next.revision++;
  return next;
}

export function viewFor(room, actor) {
  requireState(actor && (actor.role === "host" || actor.role === "player"), 401, "Unauthorized");
  const player = actor.role === "player" ? room.players.find(x => x.id === actor.playerId) : null;
  requireState(actor.role === "host" || !!player, 401, "Unauthorized");
  const shared = {
    code: room.code, phase: room.phase, round: room.round, revision: room.revision,
    teams: room.teams.map((t, i) => ({name: t.name, joined: room.players.filter(p => p.teamIndex === i).length,
      ready: !!t.captainId, locked: t.locked}))
  };
  if (!player) return {...shared, viewer: {role: "host"}};
  const team = room.teams[player.teamIndex];
  return {...shared, viewer: {role: "player", teamIndex: player.teamIndex,
    captain: team.captainId === player.id}, privateTeam: {advisers: team.advisers.slice()}};
}
