#!/bin/bash

export PATH=/path/to/anaconda3.7/bin: $PATH
ansible-playbook inventory.int remote_script.yml -vv > /home/Jenkins/KILL_JAVA_LOGS.log


statusCheck() {
    if [$1 != "0"]; then
        echo "above command failed"
        exit 1
    fi
}

trigger() {

local project_path="$1"
local action="$2"

trigger() {
    local project_path="$1"  # Removed spaces around =
    local action="$2"

    case "$action" in
        "test")
            python devtool.py test "$project_path" ; statuscheck $?  # Changed to use || for error checking
            ;;
        "lint")
            python devtool.py lint "$project_path" ; statuscheck $?  # Added error checking
            ;;
        *)
            echo "Unknown action: $action"
            exit 1
            ;;
    esac
}