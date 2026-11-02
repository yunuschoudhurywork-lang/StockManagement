# Security Notes

## ⚠️ Credential Exposure Warning

**CRITICAL:** MongoDB Atlas credentials were committed to the Git repository and may be exposed in the commit history.

### Exposed Credentials (For Reference)

The following credentials were found in the `.env` file that was committed:

- **Username:** `dipjyoti20_db_user`
- **Password:** `DNSo9yvNneYFzytY`
- **Connection String:** `mongodb+srv://dipjyoti20_db_user:DNSo9yvNneYFzytY@cluster0.blgwxrq.mongodb.net/student_management?retryWrites=true&w=majority`

### Immediate Actions Required

#### 1. Rotate MongoDB Atlas Credentials

You **MUST** rotate (change) your MongoDB Atlas database credentials immediately:

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your project and cluster
3. Navigate to **Database Access**
4. Find the user `dipjyoti20_db_user`
5. Click **Edit** or **Delete and recreate** the user
6. Generate a new strong password
7. Update your local `.env` file with the new credentials
8. **Do NOT commit** the `.env` file to Git (it's already in `.gitignore`)

#### 2. Review Database Access Logs

1. In MongoDB Atlas, go to your cluster
2. Check **Metrics** and **Access** logs
3. Look for any suspicious or unauthorized access
4. Review IP whitelist settings in **Network Access**

#### 3. Clean Git History (Advanced - Use with Caution)

**WARNING:** This requires force-pushing and will rewrite Git history. Coordinate with all team members before proceeding.

If this repository has been pushed to a remote (GitHub, GitLab, etc.), the credentials are in the remote history and must be removed:

**Option A: Using BFG Repo-Cleaner (Recommended)**

```bash
# Install BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Create a fresh clone with full history
git clone --mirror <your-repo-url> student-management-crud-mirror.git

# Remove the .env file from all commits
java -jar bfg.jar --delete-files .env student-management-crud-mirror.git

# Clean up and push
cd student-management-crud-mirror.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# Delete the mirror clone after verification
cd ..
rm -rf student-management-crud-mirror.git
```

**Option B: Using git-filter-repo (Alternative)**

```bash
# Install git-filter-repo
# pip install git-filter-repo

# Create a backup first
git clone <your-repo-url> student-management-crud-backup

# In your main repository
git filter-repo --path .env --invert-paths

# Force push to remote
git push origin --force --all
git push origin --force --tags
```

**Option C: Using git filter-branch (Manual - Last Resort)**

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
git push origin --force --tags
```

#### 4. Notify Team Members

After force-pushing:

1. **Inform all team members** that the repository history has been rewritten
2. They must delete their local clones and re-clone the repository
3. Do NOT merge old branches - they contain the exposed credentials

```bash
# Team members should run:
cd ..
rm -rf student-management-crud
git clone <your-repo-url>
```

#### 5. Consider Repository Secrets

If the repository was public on GitHub or similar platforms:

- Consider the credentials **permanently compromised**
- Rotate credentials immediately
- Consider creating a new MongoDB cluster if sensitive data exists
- Review MongoDB Atlas audit logs

### Prevention Measures

✅ **Already Implemented:**

- `.env` file is now in `.gitignore`
- `.env.example` template created (without real credentials)

✅ **Additional Recommendations:**

1. **Use Environment Variables in Production**
   - Never hardcode credentials in code
   - Use platform environment variables (Heroku, Vercel, Railway, etc.)

2. **Git Hooks**
   - Consider using `git-secrets` or similar tools
   - Add pre-commit hooks to scan for potential secrets

3. **Secret Scanning**
   - Enable GitHub/GitLab secret scanning if using those platforms
   - Consider using tools like `truffleHog` or `gitleaks`

4. **Access Control**
   - Use principle of least privilege for database users
   - Create separate database users for different environments
   - Limit IP whitelist in MongoDB Atlas (avoid `0.0.0.0/0`)

5. **Regular Audits**
   - Regularly review access logs
   - Rotate credentials periodically
   - Monitor for unusual activity

### References

- [MongoDB Atlas Security](https://docs.atlas.mongodb.com/security/)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-filter-repo](https://github.com/newren/git-filter-repo)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

**Last Updated:** Phase 1 Security Cleanup
