"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
// eslint-disable-next-line require-jsdoc
function run() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repoToken = core.getInput("repo-token", { required: true });
            const team = core.getInput("teams");
            const org = core.getInput("org");
            const amount = parseInt(core.getInput("amount"));
            const issue = github.context.issue;
            if (issue == null || issue.number == null) {
                console.log("No pull request context, skipping");
                return;
            }
            // See https://octokit.github.io/rest.js/
            const client = github.getOctokit(repoToken);
            const members = yield client.rest.teams.listMembersInOrg({
                org: org,
                team_slug: team,
            });
            console.log("Request Status for getting team members:" + members.status);
            // filter out PR author
            let memberNames = members.data.map((a) => a.login);
            console.log("Picking reviewer from members:", memberNames);
            let finalAssignees = [];
            if (amount === 0 || memberNames.length <= amount) {
                finalAssignees = memberNames;
            }
            else {
                memberNames = shuffle(memberNames);
                for (let i = 0; i < amount; i++) {
                    const name = memberNames.pop();
                    if (name !== undefined) {
                        finalAssignees.push(name);
                    }
                }
            }
            if (finalAssignees.length > 0) {
                const personResponse = yield client.rest.pulls.requestReviewers({
                    owner: issue.owner,
                    repo: issue.repo,
                    pull_number: issue.number,
                    reviewers: finalAssignees,
                });
                console.log("Request Status:" +
                    personResponse.status +
                    ", Assignees from Team " + team + ":" +
                    ((_b = (_a = personResponse === null || personResponse === void 0 ? void 0 : personResponse.data) === null || _a === void 0 ? void 0 : _a.requested_reviewers) === null || _b === void 0 ? void 0 : _b.map((r) => r.login).join(",")));
            }
            else {
                console.log("No members to assign found in team " + team);
            }
        }
        catch (error) {
            console.error(error);
            core.setFailed("Unknown error" + error);
            throw error;
        }
    });
}
exports.run = run;
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}
run();
