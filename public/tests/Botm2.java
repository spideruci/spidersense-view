package bots;

import com.github.scribejava.core.model.Response;
import org.json.JSONArray;
import org.json.JSONObject;

import org.ini4j.*;

import xyz.dmanchon.ngrok.client.NgrokTunnel;
import zoomAPI.clients.OAuthZoomClient;

import java.io.*;
import java.util.ArrayList;
import java.util.Scanner;

public class Botm2 {
    private static final String BOT_INI_PATH = "\\src\\main\\java\\bots\\bot.ini";

    private static String prompt = "Enter the letter for each corresponding command to test the bot:\n"
            + "Enter 'stop' to stop and 'help' to reprint this prompt:\n\n"
            + "\tChat channels\n"
            + "\t(a) List User's Channels\n"
            + "\t(b) Create a Channel\n"
            + "\t(c) Get a Channel\n"
            + "\t(d) Update a Channel\n"
            + "\t(e) Delete a Channel\n"
            + "\t(f) List Channel Members\n"
            + "\t(g) Invite Channel Members\n"
            + "\t(h) Join a Channel\n"
            + "\t(i) Leave a Channel\n"
            + "\t(j) Remove a Member\n\n"
            + "\tChat Messages\n"
            + "\t(k) List User's Chat Messages\n"
            + "\t(l) Send a Message\n"
            + "\t(m) Update a Message\n"
            + "\t(n) Delete a Message\n\n";


    /** =======================================================================
     * Main
     ======================================================================= */
    public static void main(String[] args) {
        // Parse the ini file
        String[] configs = readConfigs();
        if (configs == null) {
            return;
        }

        String clientId = configs[0];
        String clientSecret = configs[1];
        int port = Integer.parseInt(configs[2]);
        String browserPath = configs[3];

        try {

            // Start Ngrok tunnel
            NgrokTunnel tunnel = new NgrokTunnel(port);
            String redirectUrl = tunnel.url();

            // Initialize OAuth Zoom Client and authorize the user
            OAuthZoomClient client = new OAuthZoomClient(clientId, clientSecret, redirectUrl, browserPath, port);

            // Get first response about current user
            Response getUserResponse = client.user().get( "me");
            if (getUserResponse == null) {
                System.err.println("Response after getting user was null");
                return;
            }

            System.out.println("Status code: " + getUserResponse.getCode() + "\nStatus body: " + getUserResponse.getBody());
            JSONObject user = new JSONObject(getUserResponse.getBody());

            // Pass the client to execute
            execute(client, user);

            // Close the tunnel:
            tunnel.close();
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    /** =======================================================================
     * Methods
     ======================================================================= */
    public static String[] readConfigs() {
        try {
            String cwd = System.getProperty("user.dir");
            File f = new File(cwd + BOT_INI_PATH);

            Wini ini = new Wini(f);
            String clientId = ini.get("OAuth", "client_id");
            String clientSecret = ini.get("OAuth", "client_secret");
            String port = ini.get("OAuth", "port");
            String browser_path = ini.get("OAuth", "browser_path");

            return new String[]{clientId, clientSecret, port, browser_path};
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static void execute(OAuthZoomClient client, JSONObject user) {
        System.out.println(prompt);

        String command = "";
        Scanner scanner = new Scanner(System.in);

        while (!command.equals("stop")) {
            System.out.println("Enter command: ");
            command = scanner.nextLine();

            switch (command) {
                case "a":
                    listUsersChannels(client);
                    break;
                case "b":
                    createChannel(client, scanner, user);
                    break;
                case "c":
                    getChannel(client, scanner);
                    break;
                case "d":
                    updateChannel(client, scanner);
                    break;
                case "e":
                    deleteChannel(client, scanner);
                    break;
                case "f":
                    listChannelMembers(client, scanner);
                    break;
                case "g":
                    inviteMembers(client, scanner);
                    break;
                case "h":
                    joinChannel(client, scanner);
                    break;
                case "i":
                    leaveChannel(client, scanner);
                    break;
                case "j":
                    removeMember(client, scanner);
                    break;
                case "k":
                    listUsersMessages(client, scanner);
                    break;
                case "l":
                    sendChatMessage(client, scanner);
                    break;
                case "m":
                    updateMessage(client, scanner);
                    break;
                case "n":
                    deleteMessage(client, scanner);
                    break;
                case "help":
                    System.out.print(prompt);
                    break;
                case "stop":
                    System.out.println("Ending program...");
                    break;
                default:
                    break;
            }
        }
    }


    /** =======================================================================
     * Chat Channels
     ======================================================================= */
    // List User's Channels (GET)
    public static void listUsersChannels(OAuthZoomClient client) {
         Response response = client.chatChannels().list();
         if (response == null) {
             System.err.println("\tError - failed to retrieve a response");
             return;
         }

        System.out.println("\tResponse code: " + response.getCode());

        try {
             JSONObject obj = new JSONObject(response.getBody());
             JSONArray channels = obj.getJSONArray("channels");
             for (int i = 0; i < channels.length(); i++) {
                 JSONObject o = channels.getJSONObject(i);
                 System.out.println("\tid: " + o.get("id") + " name: " + o.get("name") + " type: " + o.getInt("type"));
             }
        } catch (Exception e) {
             e.printStackTrace();
        }
    }

    // Create a Channel (POST)
    public static void createChannel(OAuthZoomClient client, Scanner scanner, JSONObject user) {
        System.out.println("Enter name of channel:");
        String name = scanner.nextLine();

        System.out.println("Enter type (1, 2, or 3):");
        int type = Integer.parseInt(scanner.nextLine());

        System.out.println("Enter emails of other members to add or 'stop': ");
        String email = scanner.nextLine();
        ArrayList<String> emails = new ArrayList<>();
        emails.add((String) user.get("email"));
        while (!email.equals("stop")) {
            emails.add(email);
            if (emails.size() > 5) {
                break;
            }
            email = scanner.nextLine();
        }

        Response response = client.chatChannels().create(name, type, emails);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());
    }

    // Get a Channel (GET)
    public static void getChannel(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter channel id:");
        String channelId = scanner.nextLine();

        Response response = client.chatChannels().get(channelId);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());

        try {
            JSONObject obj = new JSONObject(response.getBody());
            System.out.println("\tid: " + obj.get("id") + " name: " + obj.get("name") + " type: " + obj.getInt("type"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Update a Channel (PATCH)
    public static void updateChannel(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter channel id:");
        String channelId = scanner.nextLine();

        System.out.println("Enter channel name:");
        String name = scanner.nextLine();

        Response response = client.chatChannels().update(channelId, name);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());
    }

    // Delete a Channel (DELETE)
    public static void deleteChannel(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter channel id:");
        String channelId = scanner.nextLine();

        Response response = client.chatChannels().delete(channelId);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());
    }

    // List Channel Members (GET)
    public static void listChannelMembers(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter channel id:");
        String channelId = scanner.nextLine();

        Response response = client.chatChannels().listChannelMembers(channelId);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());

        try {
            JSONObject obj = new JSONObject(response.getBody());
            JSONArray members = obj.getJSONArray("members");
            for (int i = 0; i < members.length(); i++) {
                JSONObject o = members.getJSONObject(i);
                System.out.println("\tid: " + o.get("id") + " email: " + o.get("email") + " Name: " + o.get("first_name") + " " + o.get("last_name"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Invite Channel Members (POST)
    public static void inviteMembers(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter channel id:");
        String channelId = scanner.nextLine();

        System.out.println("Enter emails of other members to add or 'stop': ");
        String email = scanner.nextLine();
        ArrayList<String> emails = new ArrayList<>();
        while (!email.equals("stop")) {
            emails.add(email);
            if (emails.size() > 5) {
                break;
            }
            email = scanner.nextLine();
        }

        Response response = client.chatChannels().inviteChannelMembers(channelId, emails);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());
    }

    // Join a Channel (POST)
    public static void joinChannel(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter channel id:");
        String channelId = scanner.nextLine();

        Response response = client.chatChannels().joinAChannel(channelId);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());

        try {
            JSONObject obj = new JSONObject(response.getBody());
            System.out.println("\tid: " + obj.get("id") + " added at " + obj.get("added_at"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Leave a Channel (DELETE)
    public static void leaveChannel(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter channel id:");
        String channelId = scanner.nextLine();

        Response response = client.chatChannels().leaveAChannel(channelId);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());
    }

    // Remove a Member (DELETE)
    public static void removeMember(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter channel id:");
        String channelId = scanner.nextLine();

        System.out.println("Enter email of member to remove:");
        String memberId = scanner.nextLine();

        Response response = client.chatChannels().removeAMember(channelId, memberId);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());
    }

    /** =======================================================================
     * Chat Messages
     ======================================================================= */
    // List User's Chat Messages (GET)
    public static void listUsersMessages(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter channel id: ");
        String channelId = scanner.nextLine();

        Response response = client.chatMessages().get("me", channelId, "", 10, "");
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());

        try {
            JSONObject obj = new JSONObject(response.getBody());
            JSONArray messages = obj.getJSONArray("messages");
            for (int i = 0; i < messages.length(); i++) {
                JSONObject o = messages.getJSONObject(i);
                System.out.println("\tid: " + o.get("id") + " message: " + o.get("message") + " sender: " + o.get("sender"));
            }
        } catch (Exception e) {
            System.err.println("\tError - couldn't parse response body");
        }
    }

    // Send a Chat Message (POST)
    public static void sendChatMessage(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter channel id: ");
        String channelId = scanner.nextLine();

        System.out.println("Enter message: ");
        String message = scanner.nextLine();

        Response response = client.chatMessages().post(message, channelId);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());
    }

    // Update a Message (PUT)
    public static void updateMessage(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter message id: ");
        String messageId = scanner.nextLine();

        System.out.println("Enter channel id: ");
        String channelId = scanner.nextLine();

        System.out.println("Enter message: ");
        String message = scanner.nextLine();

        Response response = client.chatMessages().update(messageId, message, channelId);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());
    }

    // Delete a Message (DELETE)
    public static void deleteMessage(OAuthZoomClient client, Scanner scanner) {
        System.out.println("Enter message id: ");
        String messageId = scanner.nextLine();

        System.out.println("Enter channel id: ");
        String channelId = scanner.nextLine();

        Response response = client.chatMessages().delete(messageId, channelId);
        if (response == null) {
            System.err.println("\tError - failed to retrieve a response");
            return;
        }

        System.out.println("\tResponse code: " + response.getCode());
    }
}
