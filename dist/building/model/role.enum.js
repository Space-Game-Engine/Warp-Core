"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const graphql_1 = require("@nestjs/graphql");
var Role;
(function (Role) {
    Role["RESOURCE_PRODUCTION"] = "resource";
    Role["TECHNOLOGY_PRODUCTION"] = "technology";
    Role["UNIT_PRODUCTION"] = "unit";
})(Role = exports.Role || (exports.Role = {}));
(0, graphql_1.registerEnumType)(Role, {
    name: "Building_role",
    description: "What kind of buildings are available?",
    valuesMap: {
        RESOURCE_PRODUCTION: {
            description: "Creates one or more types of resource",
        },
        TECHNOLOGY_PRODUCTION: {
            description: "Develop some kind of technology",
        },
        UNIT_PRODUCTION: {
            description: "Recruit units for your army",
        },
    },
});
//# sourceMappingURL=role.enum.js.map