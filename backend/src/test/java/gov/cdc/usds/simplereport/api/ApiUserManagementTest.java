package gov.cdc.usds.simplereport.api;

import java.util.Set;
import java.util.Arrays;
import java.util.List;
import java.util.Iterator;
import java.util.HashSet;
import java.util.stream.Collectors;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.JsonNode;

public class ApiUserManagementTest extends BaseApiTest {

    private static final List<String> USERNAMES = Arrays.asList("rjj@gmail.com", 
                                                                "rjjones@gmail.com");

    @Override
    protected Set<String> getOktaTestUsernames() {
        return USERNAMES.stream().collect(Collectors.toSet());
    }

    @Test
    public void fetchFakeUserData() {
        ObjectNode resp = runQuery("current-user-query");
        ObjectNode who = (ObjectNode) resp.get("whoami");
        assertEquals("Bobbity", who.get("firstName").asText());
        assertEquals(OrganizationRole.USER.getGrantedPermissions(), extractPermissionsFromUser(who));
    }

    @Test
    public void createUser() {
        useSuperUser();
        ObjectNode variables = JsonNodeFactory.instance.objectNode()
            .put("firstName", "Rhonda")
            .put("middleName", "Janet")
            .put("lastName", "Jones")
            .put("suffix", "III")
            .put("email", USERNAMES.get(0))
            .put("organizationExternalId", _initService.getDefaultOrganizationId());
        ObjectNode resp = runQuery("add-user", variables);
        ObjectNode user = (ObjectNode) resp.get("addUser");
        assertEquals("Rhonda", user.get("firstName").asText());
        assertEquals(USERNAMES.get(0), user.get("email").asText());
        assertEquals(_initService.getDefaultOrganizationId(), 
                     user.get("organization").get("externalId").asText());
        assertEquals(OrganizationRole.USER.getGrantedPermissions(), extractPermissionsFromUser(user));
    }

    @Test
    public void createUser_orgUser_failure() {
        ObjectNode variables = JsonNodeFactory.instance.objectNode()
            .put("firstName", "Rhonda")
            .put("middleName", "Janet")
            .put("lastName", "Jones")
            .put("suffix", "III")
            .put("email", USERNAMES.get(0))
            .put("organizationExternalId", _initService.getDefaultOrganizationId());
        runQuery("add-user", variables, ACCESS_ERROR);
    }

    @Test
    public void updateUser() {
        useSuperUser();
        ObjectNode addVariables = JsonNodeFactory.instance.objectNode()
            .put("firstName", "Rhonda")
            .put("middleName", "Janet")
            .put("lastName", "Jones")
            .put("suffix", "III")
            .put("email", USERNAMES.get(0))
            .put("organizationExternalId", _initService.getDefaultOrganizationId());
        runQuery("add-user", addVariables);

        ObjectNode updateVariables = JsonNodeFactory.instance.objectNode()
            .put("firstName", "Ronda")
            .put("middleName", "J")
            .put("lastName", "Jones")
            .put("suffix", "III")
            .put("newEmail", USERNAMES.get(1))
            .put("oldEmail", USERNAMES.get(0));
        ObjectNode resp = runQuery("update-user", updateVariables);
        ObjectNode user = (ObjectNode) resp.get("updateUser");
        assertEquals("Ronda", user.get("firstName").asText());
        assertEquals(USERNAMES.get(1), user.get("email").asText());
        assertEquals(OrganizationRole.USER.getGrantedPermissions(), extractPermissionsFromUser(user));
    }

    private Set<UserPermission> extractPermissionsFromUser(ObjectNode user) {
        Iterator<JsonNode> permissionsIter = user.get("permissions").elements();
        Set<UserPermission> permissions = new HashSet<>();
        while (permissionsIter.hasNext()) {
            permissions.add(UserPermission.valueOf(permissionsIter.next().asText()));
        }
        return permissions;
    }
}
