package com.muhammed.Sportimo.dto;

import com.muhammed.Sportimo.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {

    private String email;
    private String password;
    private Role role;
}